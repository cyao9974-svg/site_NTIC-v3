/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Member, ClubEvent, Stats } from './types';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import AdminLogin from './pages/AdminLogin';
import Layout from './components/Layout';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface CurrentUser {
  name: string;
  role: 'admin' | 'member';
}

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // For simplicity, any logged-in user via Google is considered admin if their email matches
        if ((user.email === 'cyao9974@gmail.com' || user.email === 'demo-admin@clubntic.ci') && user.emailVerified) {
          setIsAdmin(true);
          setCurrentUser({ name: user.displayName || user.email.split('@')[0], role: 'admin' });
        } else if (user.email === 'demo-admin@clubntic.ci') {
          // Special case for demo login bypass where emailVerified might not apply if we mock it
          setIsAdmin(true);
          setCurrentUser({ name: 'Admin Démo', role: 'admin' });
        } else {
          setIsAdmin(false);
          setCurrentUser({ name: user.displayName || 'User', role: 'member' });
        }
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const stats: Stats = {
    activeMembers: members.length,
    eventsPerYear: events.length,
    openSourceProjects: 25,
    participations: members.reduce((acc, m) => acc + (m.participation || 0), 0),
    activeClasses: new Set(members.map(m => m.classe)).size
  };

  useEffect(() => {
    if (!isAuthReady) return;

    // Listen to public members
    const unsubscribePublic = onSnapshot(collection(db, 'members_public'), (snapshot) => {
      const publicMembers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      
      if (isAdmin) {
        // If admin, also listen to private members and merge
        const unsubscribePrivate = onSnapshot(collection(db, 'members_private'), (privateSnapshot) => {
          const privateData = new Map(privateSnapshot.docs.map(doc => [doc.id, doc.data()]));
          const mergedMembers = publicMembers.map(pm => ({
            ...pm,
            phone: (privateData.get(pm.id) as any)?.phone || ''
          }));
          setMembers(mergedMembers as Member[]);
        });
        return () => {
          unsubscribePrivate();
        };
      } else {
        setMembers(publicMembers);
      }
    });

    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClubEvent));
      setEvents(eventsData);
    });

    return () => {
      unsubscribePublic();
      unsubscribeEvents();
    };
  }, [isAuthReady, isAdmin]);

  const addMember = async (member: Omit<Member, 'id' | 'participation' | 'registrationDate'>) => {
    const newId = `#TIC-${String(Date.now()).slice(-6)}`;
    const registrationDate = new Date().toISOString().split('T')[0];
    
    const publicData = {
      id: newId,
      lastName: member.lastName,
      firstName: member.firstName,
      classe: member.classe,
      filiere: member.filiere,
      participation: 0,
      registrationDate
    };
    
    const privateData = {
      phone: member.phone
    };

    try {
      await setDoc(doc(db, 'members_public', newId), publicData);
      await setDoc(doc(db, 'members_private', newId), privateData);
      if (!currentUser) {
        setCurrentUser({ name: `${member.firstName} ${member.lastName}`, role: 'member' });
      }
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    if (!isAdmin) return;
    try {
      const publicUpdates: any = {};
      const privateUpdates: any = {};
      
      if ('participation' in updates) publicUpdates.participation = updates.participation;
      if ('lastName' in updates) publicUpdates.lastName = updates.lastName;
      if ('firstName' in updates) publicUpdates.firstName = updates.firstName;
      if ('classe' in updates) publicUpdates.classe = updates.classe;
      if ('filiere' in updates) publicUpdates.filiere = updates.filiere;
      
      if ('phone' in updates) privateUpdates.phone = updates.phone;

      if (Object.keys(publicUpdates).length > 0) {
        await updateDoc(doc(db, 'members_public', id), publicUpdates);
      }
      if (Object.keys(privateUpdates).length > 0) {
        await updateDoc(doc(db, 'members_private', id), privateUpdates);
      }
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const addEvent = async (event: Omit<ClubEvent, 'id'>) => {
    if (!isAdmin) return;
    const newId = `evt-${Date.now()}`;
    try {
      await setDoc(doc(db, 'events', newId), { ...event, id: newId });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout currentUser={currentUser} />}>
          <Route index element={<Home onAddMember={addMember} stats={stats} />} />
          <Route path="dashboard" element={<Dashboard members={members} isAdmin={isAdmin} onUpdateMember={updateMember} currentUser={currentUser} stats={stats} />} />
          <Route path="events" element={<Events events={events} isAdmin={isAdmin} onAddEvent={addEvent} currentUser={currentUser} />} />
          <Route path="admin" element={
            <AdminLogin onLogin={(email) => {
              if (email === 'demo-admin@clubntic.ci') {
                setIsAdmin(true);
                setCurrentUser({ name: 'Admin Démo', role: 'admin' });
              }
            }} />
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  type: 'workshop' | 'meeting' | 'hackathon' | 'social';
}

export interface Member {
  id: string;
  lastName: string;
  firstName: string;
  classe: string;
  filiere: string;
  phone: string;
  participation: number;
  registrationDate: string;
}
export interface Stats {
  activeMembers: number;
  eventsPerYear: number;
  openSourceProjects: number;
  participations: number;
  activeClasses: number;
}

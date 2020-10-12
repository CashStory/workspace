import { ILogin, ISmartTable } from './auth';

interface IBox {
  _id?: string;
  name: string;
  color?: string;
  backgroundColor?: string;
  urlBg: string;
  iframe?: boolean;
  hideElements?: string[];
  login?: ILogin;
  smartTable?: ISmartTable;
  cors?: string;
  class?: string;
  injectCSS?: string;
  buttons?: IButtonSection;
  zoom: number;
  authMethod?: string;
  url?: string;
  urlApi?: string;
  autoExpand?: boolean;
  position?: number;
}

interface IWp {
  id: string;
  name?: string;
  section?: number;
  box?: string;
  logo?: ILogo;
  bobVoice?: boolean;
  data?: any;
}

export interface IShared {
  email: string;
  role: string;
}

interface IMenu {
  title: string;
  icon: string;
  sectionId: number;
}

interface ILogo {
  url: string;
  name: string;
}

interface IButtonSection {
  notebookUrl?: string;
  expandCollapse: boolean;
  openNewWindow: boolean;
  backTo: boolean;
}
interface ISection {
  id: number;
  title: string;
  description: string;
  box: IBox[];
}
export interface IWorkspace {
  linkShared: any;
  _id?: string;
  name: string;
  creatorId: string;
  logo: ILogo;
  bobVoice?: boolean;
  menu: IMenu[];
  sections: ISection[];
  shared_users: IShared[];
  createdAt?: string;
  updatedAt?: string;
}

export { IWp, IBox, ISection };

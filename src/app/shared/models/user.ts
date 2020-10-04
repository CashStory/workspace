import { ILogin } from './auth';
import { IWp } from './workspace';
import { IFavorite } from './favorite';

interface ICompany {
  name: string;
  size: string | null;
  whatUse: string | null;
  kind: string | null;
}

interface IWorspaceConfig {
  name: string;
  news:
  {
    name: string;
    lang?: string;
    class?: string;
    sources?: string[];
    categories?: string[];
  };
  favorites:
  {
    name: string;
    boxes?: IFavorite[];
    class?: string;
  };
}

interface IWorspaceList {
  [id: string]: IWorspaceConfig;
}

interface IService {
  authMethod: string;
  login: ILogin;
}
interface IServiceList {
  [name: string]: IService | boolean;
}
export { IWorspaceConfig, IService };

export interface IUser {
  _id?: string;
  creatorId: string;
  tmpAccount?: boolean;
  tmpToken: string;
  email?: string;
  picture?: string;
  phoneNumber?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: ICompany;
  role?: string;
  manager?: string;
  userRole?: string;
  reset?: boolean;
  workspaceCurrent: IWp;
  workspaces?: IWorspaceList;
  services?: IServiceList;
  registerReferer?: string;
  createdAt?: string;
  updatedAt?: string;
}

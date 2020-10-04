import { IWp } from './workspace';
interface Itarget {
  sectionId: string;
  boxId: string;
  workspaceId: string;
}

interface IFavorite {
  _id?: string;
  name: string;
  description: string;
  attachement?: string;
  attachement_type?: 'image' | 'video' | 'iframe';
  target?: string;
  wp?: IWp;
  target_type?: 'internal' | 'external' | 'external_same';
  column: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export { Itarget, IFavorite };

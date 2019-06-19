import { Photo } from './Photo';

export interface Settings {
  contractor: boolean,
  contractor_available: boolean,
  currency: string,
  logo: Photo,
  name: string,
  version: string,
  work_order_review: string
}

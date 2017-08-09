export class User {
  _id: string;
  email: string;
  name: string;
  password:string;
  hash: string;
  salt: string;
  role?: string;
  loclist?: string[];
  expiredOn?:string;
}


interface ILogin {
  username: string;
  password: string;
  updatedAt?: string;
  createdAt?: string;
}
enum IRights {
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  POST = 'POST',
}
interface ISmartTable {
  database: string;
  collection: string;
  settings: object;
  model?: string;
  rights?: IRights[];
}

export { ILogin, ISmartTable };

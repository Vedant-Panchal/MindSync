export type SignIn = {
  email: string
  password: string
}

// let's imagine this file is autogenerated from the backend
// ideally, we want to keep these api related types in sync
// with the backend instead of manually writing them out

export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};



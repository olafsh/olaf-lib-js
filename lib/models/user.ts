export class UserPermissionsModel {
  app_label: string;
  name: string;
  description: string;

  constructor() {
    this.app_label = "";
    this.name = "";
    this.description = "";
  }
}

export class UserModel {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  permissions: UserPermissionsModel[];
  is_superuser: boolean;
  has_otp: boolean;
  last_login: string;

  constructor() {
    this.id = "";
    this.first_name = "";
    this.last_name = "";
    this.full_name = "";
    this.email = "";
    this.permissions = [];
    this.is_superuser = false;
    this.has_otp = false;
    this.last_login = "";
  }
}

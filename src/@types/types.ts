export interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export interface IRegistrationBody {
  email: string;
  password?: string;
  avatar?: string;
  phone?: string;
}

export interface IActivationToken {
  token: string;
  activationCode: string;
}

export interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

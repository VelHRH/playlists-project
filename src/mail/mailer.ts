export type Email = {
  to: string;
  subject: string;
  text: string;
};

export type Mailer = {
  send(email: Email): Promise<void>;
};

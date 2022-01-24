export class Environment {
  static isDev() {
    console.log('env == ', process.env.NODE_ENV);
    return process.env.NODE_ENV === 'development';
  }
}

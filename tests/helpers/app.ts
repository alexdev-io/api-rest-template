import { buildApp } from "../../src/app";

let _app: Awaited<ReturnType<typeof buildApp>>;

export const getTestApp = async () => {
  if (!_app) {
    _app = await buildApp();
    await _app.ready();
  }
  return _app;
};

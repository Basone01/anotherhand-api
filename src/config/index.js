const path = require("path");
const dbpath = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
const FB_PAGE_TOKEN = process.env.PAGE_TOKEN;
const FB_WEBHOOK_TOKEN = process.env.FB_WEBHOOK_TOKEN;
const DEV_MODE = process.env.NODE_ENV === "development";
const HOST =
  process.env.NODE_ENV === "development"
    ? "https://a42db2cd.ngrok.io"
    : "https://anotherhand.herokuapp.com";
module.exports = {
  db: dbpath,
  FB_PAGE_TOKEN,
  FB_WEBHOOK_TOKEN,
  DEV_MODE,
  DEV_SHOP_ID: "5aef68434619c318f8343d89",
  ROOT_DIR: path.join(__dirname, "../"),
  HOST,
  firebase: {
    type: "service_account",
    project_id: "anotherhand-f3eea",
    private_key_id: "a845b296d9e3b68f585c1e332ab280ee78381413",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBK83kcDDryuzk\n/AbSoQ3L/UdqFKPApInvJDeQycsFQJHpJmFLd6HZlrzRJ2MKN5opKqc+flZiJccX\nT3dz/0XkRHyquY2qeUQrTS/qrwrf0uyDy3oAnKyiWs1ET7ioIQuzCuKXvgOQsv1u\nt/lsWcfFIZlxZrtFaGVLezOqbn1RrwJGyE/BLu9wn/nrwGpsKidicFnIw4PrSDEn\n3aW5brlUuOUCkPCOPfYdo9CtoSOkK9AdVnm6Vmpl+PzlnB2plmT9/e1EYYIbdQUa\nYR523bqaELlhyy0EiiLGarp2iRIEmNiTBNcP6x/uukW7tgaj3+juvFA0UOFg1MbZ\n4z+mv/bpAgMBAAECggEAELwocIjzrrR8L3OnbP9SQFY8pfO3Irez0h7zcry4tPIc\nx0kcQWXSL2qVXb1UIYzNnea5vyVCJetF7elkMjgZqFFH8kvJpSIvsLIAMQxhxyBG\nfeiBNPpdzmGgH4c/OnmabN7INgMv2zer0w1nM2bXyBFFci3x6BfHkXF7+WDsbx4G\nc36pqxPaJA/9FV/N+36PxwSVLdDbuEh6qvRSPbO14RA1CizqzubKsGQ4InAL1FZp\n78p/4N7s83rinmP94LM6wctXpBi2E6W7gD4ZksU1fYcVjDAFQ+1PGvgPJ6EiKWEt\nPiYySxUv1uZa8EFv/v8AJsgxkRnkMxf4aCwjXjcx/QKBgQD8soZXzu32FdMFWJkt\nOJis6Nuy2McfLjJtUdx4i4uWIAC82YpAVKo/OtyouyTA877Qj5KmwSA7iylfciz6\nC8R+s8QVrCUE3h6PkONZFQgkteq3sAPni47icSW32J03x+7HWRRxxqdlWdTLeS0+\n3fyP6Wo66qSOHv56wpj+CE8cjwKBgQDDsh3QnELAsl9eHJbkrajeCQW9x5HLS2gl\nCw9LqIgIGkc/3/Qz4LWvUVM9HAEwwiZYtybmQT4Yviv/cmJ1ADquQiKxIQkI8GUA\nSrr+vbxDimVDVOomWTpb/XlWfxFFTNIrG5MKpRL2DM8mm34sURucsa4b5w7Ylfr9\n+beaSvxhBwKBgBFNC8OhSEuL7Pm1ui8Na+6SttAE5YUt/YfcjfK24ySxJjvHzR5g\nbZOMrSTkQzzus0bGPa0rFdDd00RUpd2sxpRCLI+rTJGLv53mtpoXxYn15o8S/wFw\nXaUFSCbRLtpt1txRLgQoLLfUsawIrN9cBXm46mwEOqX8W0H+ZsklunzjAoGAK8yV\nt7cBibdieOHVM+FaRjemvU8JZoK+EGxlQ/24VHftMnKhaWsFvvNoueimq48Inhp/\n7lDz4P3PQyEKwD0I5S+QLCzEpOeI84PGTnWQyV0URPmgXmziDuywV5eg+e2zrEpD\nosJHeCJtyqpKlwigMXXjDgOs4vTOdEGLwlC+I8kCgYEAyypghXb8GabiMV8FFaW3\n0tw3VQQ+WORsLf1EoOPKcwb6zvr75/DHPM9yuihd611PKiuyBpu4W9/X83UOf7O6\nu96ViSyBGIRJlm5DPztqCprwFRd3QawCgemw0UHfhau1UeHCLcwZ1eZH0Alsn/RF\noT0/mFtAk8jrswZyzcFnTuY=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-dg2xf@anotherhand-f3eea.iam.gserviceaccount.com",
    client_id: "106996864994484090504",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://accounts.google.com/o/oauth2/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dg2xf%40anotherhand-f3eea.iam.gserviceaccount.com"
  }
};

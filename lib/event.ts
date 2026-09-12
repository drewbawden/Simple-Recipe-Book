import { Client } from "pg";

type Listener = (event: string, data: unknown) => void;

const listeners = new Set<Listener>();
const notificationChannel = "shopping_list_updates";
let notificationClient: Client | undefined;
let notificationConnection: Promise<void> | undefined;

const dispatch = (event: string, data: unknown) => {
  for (const listener of listeners) {
    listener(event, data);
  }
};

const ensureNotificationClient = async () => {
  if (notificationClient) return notificationClient;
  if (notificationConnection) {
    await notificationConnection;
    return notificationClient;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  notificationConnection = client
    .connect()
    .then(() => client.query(`LISTEN ${notificationChannel}`))
    .then(() => {
      client.on("notification", (message) => {
        if (!message.payload) return;

        const { event, data } = JSON.parse(message.payload) as {
          event: string;
          data: unknown;
        };
        dispatch(event, data);
      });
      client.on("error", () => {
        if (notificationClient === client) notificationClient = undefined;
        notificationConnection = undefined;
      });
      notificationClient = client;
    })
    .catch((error) => {
      notificationConnection = undefined;
      console.error("Failed to connect to shopping list notifications:", error);
    });

  await notificationConnection;
  return notificationClient;
};

export function subscribe(listener: Listener) {
  listeners.add(listener);
  void ensureNotificationClient();

  return () => {
    listeners.delete(listener);
  };
}

export function broadcast(event: string, data: unknown = {}) {
  dispatch(event, data);

  void ensureNotificationClient().then((client) => {
    if (!client) return;

    return client.query("SELECT pg_notify($1, $2)", [
      notificationChannel,
      JSON.stringify({ event, data }),
    ]);
  });
}

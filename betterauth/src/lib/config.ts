const config = {
  env: {
    databaseURL: process.env.DATABASE_URL || "",
    nodeENV: process.env.NODE_ENV || "",
  },
};

export default config;
// @flow
const fs = jest.genMockFromModule("fs");
fs.promises = {
  opendir: async () => {
    return [];
  },
  writeFile: async (path: string, content: string) => {
    return 1;
  },
};
fs.readFileSync = (path: string): Buffer => {
  return Buffer.from(
    JSON.stringify({
      personal: "/tmp/test",
    }),
    "utf8"
  );
};
export default fs;

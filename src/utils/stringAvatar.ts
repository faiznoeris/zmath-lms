import { stringToColor } from "./stringToColor";

export const stringAvatar = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0].toUpperCase()}${name.split(" ")[1][0].toUpperCase()}`,
  };
};

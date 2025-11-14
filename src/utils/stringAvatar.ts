import { stringToColor } from "./stringToColor";

export const stringAvatar = (name: string) => {
  const splitName = name.split(" ");
  const initialName = splitName
    .map(word => word?.split("")?.[0]?.toUpperCase())
    .join("");

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initialName,
  };
};

import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

export default StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 12,
  },
  card: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  textTitle: {
    color: colors.primary,
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
  },
  textBody: {
    color: colors.secondary,
    fontSize: 16,
  },
});

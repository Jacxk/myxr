import { toast } from "sonner";

export const ErrorToast = {
  login: () => toast.error("You need to login first."),
  internal: (description?: string) =>
    toast.error("There was an internal error!", { description }),
  selectGuild: () => toast.error("You need to select a guild first"),
  soundNotFound: () => toast.error("The sound was not found."),
  guildNotFound: () =>
    toast.error("This guild is not valid. Is the bot inside the guild?"),
  soundExistsInGuild: () => toast.error("Sound already exists in the guild"),
  soundAlreadyReported: () =>
    toast.error("You have already reported this sound."),
  invalidReport: () => toast.error("Please provide a valid reason."),
  invalidAudioFile: () =>
    toast.error("Invalid file type. Please upload an audio file."),

  unauthorized: () =>
    toast.error("You are not authorized to perform this action."),
  notFound: () => toast.error("The requested resource was not found."),
  formError: () => toast.error("Please check the form for errors."),
  timeout: () => toast.error("The request timed out. Please try again."),
  network: () => toast.error("Network error. Please check your connection."),
  forbidden: () =>
    toast.error("You do not have permission to access this resource."),
  conflict: () =>
    toast.error("There is a conflict with the current state of the resource."),
  validation: () => toast.error("Validation failed. Please correct the input."),
  serverDown: () =>
    toast.error("The server is currently unavailable. Please try later."),
  failedToDeleteAccount: () =>
    toast.error("Failed to delete account. Please try again."),
  invalidEmail: () => toast.error("Invalid email. Please try again."),
};

import { type Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  baseTheme: undefined,
  layout: {
    logoPlacement: "none",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    shimmer: false,
    animations: false,
  },
  variables: {
    colorPrimary: "rgb(35, 124, 241)",
    colorText: "#000000",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#000000",

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "0.9375rem",

    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "440px",
    },
    
    card: {
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      borderRadius: "0.75rem",
      border: "1px solid #f3f4f6",
      padding: "2.5rem",
    },
    
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#000000",
      textAlign: "center",
      marginBottom: "0.5rem",
    },
    
    headerSubtitle: {
      fontSize: "0.9375rem",
      color: "#6b7280",
      textAlign: "center",
      fontWeight: "400",
      marginBottom: "2rem",
    },
    
    socialButtonsContainer: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    
    socialButtonsBlockButton: {
      flex: "1",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      height: "2.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontSize: "0.9375rem",
      fontWeight: "500",
      color: "#374151",
      padding: "0 1rem",
      transition: "all 0.15s",
      "&:hover": {
        backgroundColor: "#f9fafb",
        borderColor: "#d1d5db",
      },
    },
    
    socialButtonsBlockButtonText: {
      color: "#374151",
      fontSize: "0.9375rem",
      fontWeight: "500",
    },
    
    socialButtonsProviderIcon: {
      width: "1.125rem",
      height: "1.125rem",
    },
    
    dividerRow: {
      margin: "1.5rem 0",
    },
    
    dividerLine: {
      backgroundColor: "#e5e7eb",
    },
    
    dividerText: {
      color: "#9ca3af",
      fontSize: "0.875rem",
      fontWeight: "400",
      backgroundColor: "#ffffff",
      padding: "0 0.75rem",
    },
    
    formFieldRow: {
      marginBottom: "1.25rem",
    },
    
    formFieldLabel: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#000000",
      marginBottom: "0.375rem",
    },
    
    formFieldInput: {
      backgroundColor: "#ffffff",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      fontSize: "0.9375rem",
      height: "2.75rem",
      padding: "0 0.875rem",
      color: "#000000",
      transition: "border-color 0.15s",
      "&:hover": {
        borderColor: "#9ca3af",
      },
      "&:focus": {
        borderColor: "#6b7280",
        outline: "none",
        boxShadow: "none",
      },
      "&::placeholder": {
        color: "#9ca3af",
      },
    },
    
    formFieldInputShowPasswordButton: {
      color: "#6b7280",
      "&:hover": {
        color: "#374151",
      },
    },
    
    formButtonPrimary: {
      backgroundColor: "rgb(35, 124, 241)",
      color: "#ffffff",
      fontSize: "0.9375rem",
      fontWeight: "600",
      height: "2.75rem",
      borderRadius: "0.5rem",
      width: "100%",
      marginTop: "1.5rem",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.15s",
      "&:hover": {
        backgroundColor: "rgba(35, 124, 241, 0.9)",
      },
      "&:active": {
        backgroundColor: "rgba(35, 124, 241, 0.8)",
      },
      "&:focus": {
        outline: "none",
      },
    },
    
    
    footerAction: {
      textAlign: "center",
    },
    
    footerActionText: {
      fontSize: "0.9375rem",
      color: "#6b7280",
    },
    
    footerActionLink: {
      color: "#000000",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textDecoration: "none",
      marginLeft: "0.25rem",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    
    identityPreview: {
      backgroundColor: "#f9fafb",
      borderRadius: "0.5rem",
      padding: "0.75rem",
      marginBottom: "1rem",
    },
    
    identityPreviewText: {
      fontSize: "0.875rem",
      color: "#374151",
    },
    
    identityPreviewEditButton: {
      color: "#3b82f6",
      fontSize: "0.875rem",
      marginLeft: "0.5rem",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    
    formFieldError: {
      color: "#ef4444",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
    },
    
    formFieldSuccess: {
      color: "#22c55e",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
    },
    
    otpCodeFieldInput: {
      width: "3rem",
      height: "3rem",
      fontSize: "1.25rem",
      textAlign: "center",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      "&:focus": {
        borderColor: "#6b7280",
        outline: "none",
      },
    },
    
    formResendCodeLink: {
      color: "#3b82f6",
      fontSize: "0.875rem",
      "&:hover": {
        textDecoration: "underline",
      },
    },

    // Completely hide all footer and branding elements
    footerPages: {
      display: "none !important",
      visibility: "hidden !important",
      height: "0 !important",
      margin: "0 !important",
      padding: "0 !important",
    },

    footerPagesLink: {
      display: "none !important",
    },

    footer: {
      display: "none !important",
      visibility: "hidden !important",
      height: "0 !important",
      margin: "0 !important",
      padding: "0 !important",
    },

    badge: {
      display: "none !important",
      visibility: "hidden !important",
      height: "0 !important",
      margin: "0 !important",
      padding: "0 !important",
    },
    
    // Hide elements we don't want
    headerBackLink: {
      display: "none",
    },
    
    headerBackIcon: {
      display: "none",
    },
    
    backLink: {
      display: "none",
    },
    
    // Hide LinkedIn button
    "socialButtonsBlockButton[data-id*='linkedin']": {
      display: "none !important",
    },
    
    "socialButtonsIconButton[data-id*='linkedin']": {
      display: "none !important",
    },
    
    // Hide LinkedIn by provider
    "socialButtonsBlockButton:nth-of-type(2)": {
      display: "none",
    },
  },
};
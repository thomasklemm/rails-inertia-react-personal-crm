import AppLogoIcon from "./app-logo-icon"

export default function AppLogo() {
  return (
    <>
      <div className="size-9 shrink-0">
        <AppLogoIcon className="size-full" />
      </div>
      <div className="ml-1 grid min-w-0 flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-tight font-semibold">
          {import.meta.env.VITE_APP_NAME ?? "Personal CRM"}
        </span>
      </div>
    </>
  )
}

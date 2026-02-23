import AppLogoIcon from "./app-logo-icon"

export default function AppLogo() {
  return (
    <>
      <AppLogoIcon className="!size-5 shrink-0 self-center" />
      <div className="ml-1 flex min-w-0 flex-1 flex-col justify-center text-left text-sm group-data-[collapsible=icon]:hidden">
        <span className="truncate leading-tight font-semibold">
          {import.meta.env.VITE_APP_NAME ?? "Personal CRM"}
        </span>
      </div>
    </>
  )
}

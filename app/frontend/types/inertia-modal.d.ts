declare module "@inertiaui/modal-react" {
  import type {
    AnchorHTMLAttributes,
    ComponentType,
    ReactElement,
    ReactNode,
  } from "react"

  interface ModalRenderProps {
    close: () => void
    reload: () => void
    id: string
    index: number
  }

  interface ModalProps {
    children?: ReactNode | ((props: ModalRenderProps) => ReactNode)
    maxWidth?:
      | "sm"
      | "md"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl"
      | "7xl"
    closeButton?: boolean
    closeExplicitly?: boolean
    paddingClasses?: string
    panelClasses?: string
    position?: "center" | "top"
    slideover?: boolean
  }

  interface ModalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    navigate?: boolean
    slideover?: boolean
    closeButton?: boolean
    closeExplicitly?: boolean
    maxWidth?: string
    paddingClasses?: string
    panelClasses?: string
    method?: "get" | "post" | "put" | "patch" | "delete"
    data?: Record<string, unknown>
    headers?: Record<string, string>
    children?: ReactNode
  }

  export const Modal: ComponentType<ModalProps>
  export const ModalLink: ComponentType<ModalLinkProps>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function renderApp(App: any, props: any): ReactElement

  export function putConfig(config: Record<string, unknown>): void

  export function useModal(): ModalRenderProps
}

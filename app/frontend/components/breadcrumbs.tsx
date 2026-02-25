import { Link } from "@inertiajs/react"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types"

export function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbItemType[]
}) {
  return (
    <>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Fragment key={index}>
                  <BreadcrumbItem
                    className={isLast ? "min-w-0 overflow-hidden" : "shrink-0"}
                  >
                    {isLast ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="shrink-0" />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </>
  )
}

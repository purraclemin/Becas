import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface PageHeaderProps {
  title: string
  breadcrumbs: { label: string; href?: string }[]
}

export function PageHeader({ title, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="bg-[#1e3a5f] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-extrabold text-[#ffffff] font-serif md:text-4xl text-balance">
          {title}
        </h1>
        <nav aria-label="Breadcrumb" className="mt-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-[#8a9bbd]">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-[#d4a843]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#d4a843]">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}

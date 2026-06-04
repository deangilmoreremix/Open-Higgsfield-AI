import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ProspectLanding } from "@/components/prospect-landing"
import { getCompanyByName, getDemoVideo, type Company, type DemoVideo } from "@/lib/api-server"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyByName(decodeURIComponent(slug))

  if (!company) {
    return {
      title: "Company Not Found | Chocomotion",
    }
  }

  return {
    title: `${company.name} | Chocomotion`,
    description: company.valueProp,
    openGraph: {
      title: `${company.name} | Chocomotion`,
      description: company.valueProp,
      ...(company.logoUrl && { images: [{ url: company.logoUrl }] }),
    },
  }
}

export default async function ProspectPage({ params }: PageProps) {
  const { slug } = await params
  const company = await getCompanyByName(decodeURIComponent(slug))

  if (!company) {
    notFound()
  }

  const demoVideo = await getDemoVideo(company.id)

  return <ProspectLanding company={company} demoVideo={demoVideo} />
}

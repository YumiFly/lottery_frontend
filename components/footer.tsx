"use client"

import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-emerald-600">W3Lottery</h3>
            <p className="text-sm text-gray-600">{t("footer.description")}</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("common.results")}
                </Link>
              </li>
              <li>
                <Link href="/buy" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("common.buyTickets")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("footer.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.connect")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-emerald-600">
                  Telegram
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} W3Lottery. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { useEffect, useState } from "react"

// Componente Instagram Embed para evitar problemas de hidratação
function InstagramEmbed() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zm2.523 18.408c-.6.729-1.699.729-2.523 0l-1.743-2.091c-.51-.729-.51-1.717 0-2.446l1.743-2.092c.824-.729 1.923-.729 2.523 0l1.743 2.092c.51.729.51 1.717 0 2.446l-1.743 2.091z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Carregando Instagram...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 flex items-center justify-center">
      <div 
        dangerouslySetInnerHTML={{
          __html: `
            <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DEDvNw8xXax/?utm_source=ig_embed&utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:12px; box-shadow:none; margin: 0; max-width:100%; padding:0; width:100%; height:320px;"><div style="padding:16px; height:100%; display:flex; flex-direction:column;"> <a href="https://www.instagram.com/reel/DEDvNw8xXax/?utm_source=ig_embed&utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%; flex:1; display:flex; flex-direction:column; justify-content:center;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center; margin-bottom:16px;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="flex:1; display:flex; align-items:center; justify-content:center;"> <div style="display:block; height:60px; margin:0 auto; width:60px;"><svg width="60px" height="60px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#E1306C"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px; text-align:center;">Ver essa foto no Instagram</div></div> <div style="padding: 12px 0;"></div><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DEDvNw8xXax/?utm_source=ig_embed&utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Uma publicação compartilhada por Nice Trip | Viajes a Brasil (@nicetripturismo)</a></p></div></blockquote>
            <script async src="//www.instagram.com/embed.js"></script>
          `
        }}
      />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Left Side - Logo and Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
                          <Image
              src="/images/nicetrip-logo-1.png"
                alt="Nice Trip"
                width={140}
                height={35}
                className="h-10 w-auto"
              />
            </Link>
            <div className="space-y-1">
              <p className="text-gray-900 font-medium">Nice Trip Turismo</p>
              <p className="text-gray-600 text-sm">Florianópolis, Brasil/SC</p>
            </div>
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-4 lg:text-right">
            <div className="space-y-3">
              <div className="flex items-center lg:justify-end space-x-2">
                <Phone className="w-4 h-4 text-[#EE7215]" />
                <span className="text-gray-900 font-medium">+55 48 99860-1754</span>
              </div>
              <div className="flex items-center lg:justify-end space-x-2">
                <Mail className="w-4 h-4 text-[#EE7215]" />
                <span className="text-gray-900 font-medium">reservas@nicetripturismo.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps and Instagram Section */}
        <div className="py-12 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Google Maps */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Nossa Localização</h3>
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3541.304079165669!2d-48.46227752399955!3d-27.428632614958566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x952743a26f31cfa7%3A0x25aac1a625c2a7b8!2sNice%20Trip%20Turismo!5e0!3m2!1spt-BR!2sbr!4v1753470004725!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="320" 
                  style={{border: 0}} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl"
                />
              </div>
            </div>

            {/* Instagram Embed */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Siga-nos no Instagram</h3>
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 bg-white">
                <InstagramEmbed />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">© 2025 Nice Trip Turismo. Todos los derechos reservados.</p>
            <p className="text-gray-500 text-sm">
              Una empresa del<br />
              <span className="text-[#EE7215] font-medium">FLN GROUP</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

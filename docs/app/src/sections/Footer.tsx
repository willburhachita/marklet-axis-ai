import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [sanaSolutionsOpen, setSanaSolutionsOpen] = useState(false);
  const [learnSolutionsOpen, setLearnSolutionsOpen] = useState(false);

  return (
    <footer className="pt-10 pb-6 border-t border-gray-200">
      <div className="max-w-[1496px] mx-auto px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Left Column - Logo and Newsletter */}
          <div className="flex flex-col justify-between">
            {/* Logo */}
            <a href="/" className="inline-flex mb-16">
              <svg 
                viewBox="0 0 32 32" 
                className="h-10 w-10"
                fill="currentColor"
              >
                <path d="M15.073 6.522c0.174 0 0.268-0.107 0.295-0.268 0.402-2.17 0.362-2.277 2.692-2.692 0.161-0.040 0.268-0.134 0.268-0.308 0-0.161-0.107-0.268-0.268-0.295-2.33-0.415-2.29-0.522-2.692-2.692-0.027-0.161-0.121-0.268-0.295-0.268s-0.268 0.107-0.295 0.268c-0.402 2.17-0.362 2.277-2.692 2.692-0.174 0.027-0.268 0.134-0.268 0.295 0 0.174 0.094 0.268 0.268 0.308 2.33 0.415 2.29 0.522 2.692 2.692 0.027 0.161 0.12 0.268 0.295 0.268z"/>
                <path d="M8.587 15.737c0.254 0 0.429-0.174 0.455-0.415 0.482-3.576 0.603-3.576 4.299-4.286 0.228-0.040 0.402-0.201 0.402-0.455 0-0.241-0.174-0.415-0.402-0.442-3.696-0.522-3.83-0.643-4.299-4.272-0.027-0.254-0.201-0.429-0.455-0.429-0.241 0-0.415 0.174-0.455 0.442-0.429 3.576-0.629 3.563-4.299 4.259-0.228 0.040-0.402 0.201-0.402 0.442 0 0.268 0.174 0.415 0.455 0.455 3.643 0.589 3.817 0.683 4.246 4.259 0.040 0.268 0.214 0.442 0.455 0.442z"/>
                <path d="M17.671 30.538c0.348 0 0.603-0.255 0.67-0.616 0.951-7.326 1.982-8.451 9.241-9.254 0.375-0.040 0.629-0.308 0.629-0.67 0-0.348-0.255-0.616-0.629-0.656-7.259-0.804-8.29-1.929-9.241-9.268-0.067-0.362-0.321-0.603-0.67-0.603s-0.603 0.241-0.656 0.603c-0.951 7.339-1.995 8.464-9.241 9.268-0.388 0.040-0.643 0.308-0.643 0.656 0 0.362 0.254 0.63 0.643 0.67 7.232 0.951 8.237 1.928 9.241 9.254 0.054 0.362 0.308 0.616 0.656 0.616z"/>
              </svg>
            </a>

            {/* Newsletter Form */}
            <div className="max-w-[220px]">
              <form className="relative">
                <input 
                  type="email" 
                  placeholder="Your email*"
                  className="w-full bg-transparent border-0 border-b border-black/20 py-2 text-sm placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
                />
              </form>
            </div>
          </div>

          {/* Right Column - Links */}
          <div className="grid grid-cols-3 gap-5">
            {/* Sana Column */}
            <div>
              <p className="text-sm font-semibold mb-6">Sana</p>
              <ul className="space-y-2">
                <li><a href="/products/sana" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Overview</a></li>
                <li><a href="/products/sana/ai-agents" className="text-sm text-black/60 hover:opacity-60 transition-opacity">AI agents</a></li>
                <li><a href="/products/sana/enterprise-search" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Enterprise search</a></li>
                <li><a href="/products/sana/ios-app" className="text-sm text-black/60 hover:opacity-60 transition-opacity">iOS app</a></li>
                <li className="relative">
                  <button 
                    className="flex items-center gap-2 text-sm text-black/60 hover:opacity-60 transition-opacity"
                    onClick={() => setSanaSolutionsOpen(!sanaSolutionsOpen)}
                  >
                    Solutions <ChevronDown className={`w-4 h-4 transition-transform ${sanaSolutionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sanaSolutionsOpen && (
                    <div className="mt-2 space-y-1 pl-2">
                      <a href="/products/sana/solutions/industries/financial-services" className="block text-xs text-black/60 py-1">Financial services</a>
                      <a href="/products/sana/solutions/industries/consulting-firms" className="block text-xs text-black/60 py-1">Consulting firms</a>
                      <a href="/products/sana/solutions/industries/law-firms" className="block text-xs text-black/60 py-1">Law firms</a>
                      <a href="/products/sana/solutions/industries/tech-companies" className="block text-xs text-black/60 py-1">Tech companies</a>
                      <a href="/products/sana/solutions/industries/private-equity" className="block text-xs text-black/60 py-1">Private equity</a>
                      <a href="/products/sana/solutions/industries/industrial-companies" className="block text-xs text-black/60 py-1">Industrial companies</a>
                    </div>
                  )}
                </li>
                <li><a href="/products/sana/integrations" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Integrations</a></li>
                <li><a href="/products/sana/events" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Events</a></li>
                <li><a href="/products/sana/security" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Security</a></li>
                <li><a href="/products/sana/stories" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Stories</a></li>
                <li><a href="/products/sana/pricing" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Pricing</a></li>
                <li><a href="https://support.sana.ai/en/" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Help Center</a></li>
              </ul>
            </div>

            {/* Sana Learn Column */}
            <div>
              <p className="text-sm font-semibold mb-6">Sana Learn</p>
              <ul className="space-y-2">
                <li><a href="/products/sana-learn" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Overview</a></li>
                <li><a href="/products/sana-learn/learning-management" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Learning management</a></li>
                <li><a href="/products/sana-learn/content-creation" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Content creation</a></li>
                <li><a href="/products/sana-learn/ai-tutor" className="text-sm text-black/60 hover:opacity-60 transition-opacity">AI tutor</a></li>
                <li className="relative">
                  <button 
                    className="flex items-center gap-2 text-sm text-black/60 hover:opacity-60 transition-opacity"
                    onClick={() => setLearnSolutionsOpen(!learnSolutionsOpen)}
                  >
                    Solutions <ChevronDown className={`w-4 h-4 transition-transform ${learnSolutionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {learnSolutionsOpen && (
                    <div className="mt-2 space-y-1 pl-2">
                      <a href="/products/sana-learn/solutions/sales-enablement" className="block text-xs text-black/60 py-1">Sales enablement</a>
                      <a href="/products/sana-learn/solutions/compliance-training" className="block text-xs text-black/60 py-1">Compliance training</a>
                      <a href="/products/sana-learn/solutions/employee-onboarding" className="block text-xs text-black/60 py-1">Employee onboarding</a>
                      <a href="/products/sana-learn/solutions/external-training" className="block text-xs text-black/60 py-1">External training</a>
                      <a href="/products/sana-learn/solutions/leadership-development" className="block text-xs text-black/60 py-1">Leadership development</a>
                    </div>
                  )}
                </li>
                <li><a href="/products/sana-learn/customer-stories" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Customer stories</a></li>
                <li><a href="/products/sana-learn/integrations" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Integrations</a></li>
                <li><a href="/products/sana-learn/events" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Events</a></li>
                <li><a href="/products/sana-learn/pricing" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Pricing</a></li>
                <li><a href="https://help.sana.ai/en/" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Help Center</a></li>
                <li><a href="/sana-learn-changelog" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Changelog</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <p className="text-sm font-semibold mb-6">Company</p>
              <ul className="space-y-2">
                <li><a href="/events/sana-ai-summit-2026" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Sana AI Summit 2026</a></li>
                <li><a href="/strange-loop" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Strange Loop Podcast</a></li>
                <li><a href="/ai-reform" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Swedish AI Reform</a></li>
                <li><a href="/about" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Mission</a></li>
                <li><a href="/careers" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Careers</a></li>
                <li><a href="/press" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Press</a></li>
                <li><a href="/legal" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Legal</a></li>
                <li><a href="/legal/cookie-settings" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Cookie settings</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="grid grid-cols-12 gap-5 pt-4 border-t border-gray-100">
          {/* Workday Logo */}
          <div className="col-span-2">
            <a href="https://www.workday.com/" target="_blank" rel="noopener noreferrer" className="inline-block opacity-60 hover:opacity-100 transition-opacity">
              <svg width="131" height="28" viewBox="0 0 131 28" fill="none" className="w-full max-w-[131px]">
                <g clipPath="url(#clip0_2265_5035)">
                  <path d="M23.6704 17.108H22.5618C22.3575 17.108 22.2186 17.2107 22.1854 17.3994C21.8971 18.9788 21.5538 20.608 21.0934 22.204L19.7639 17.3994C19.7131 17.2117 19.5772 17.108 19.373 17.108H17.8713C17.667 17.108 17.5312 17.2107 17.4804 17.3994L16.1509 22.204C15.6904 20.607 15.3472 18.9788 15.0589 17.3994C15.0226 17.2117 14.8878 17.108 14.6824 17.108H13.5738C13.3364 17.108 13.2337 17.2626 13.2855 17.4855C13.745 19.7151 14.2894 21.9292 15.0921 24.1588C15.1584 24.3642 15.2787 24.4503 15.483 24.4503H16.7285C16.9152 24.4503 17.0687 24.3652 17.1195 24.1588L18.619 18.8741L20.1186 24.1588C20.1694 24.3642 20.3229 24.4503 20.5095 24.4503H21.7581C21.9624 24.4503 22.0796 24.3652 22.1491 24.1588C22.9528 21.9292 23.4972 19.7151 23.9556 17.4855C24.0064 17.2615 23.9048 17.108 23.6673 17.108H23.6704Z" fill="currentColor"/>
                  <path d="M52.8436 13.7947H51.7516C51.5317 13.7947 51.4114 13.916 51.4114 14.139V17.947C50.9873 17.3279 50.3049 16.9846 49.4691 16.9846C47.5423 16.9846 46.3932 18.3753 46.3932 20.7781C46.3932 23.1809 47.535 24.5695 49.4628 24.5695C50.3174 24.5695 51.0153 24.2086 51.4415 23.5926L51.5618 24.1402C51.5981 24.3455 51.7329 24.4482 51.9383 24.4482H52.8426C53.0624 24.4482 53.1827 24.3289 53.1827 24.107V14.14C53.1837 13.916 53.0666 13.7957 52.8436 13.7957V13.7947ZM49.8227 23.2452C48.8697 23.2452 48.2371 22.4405 48.2371 20.9824V20.5717C48.2371 19.1168 48.8655 18.3089 49.8227 18.3089C50.896 18.3089 51.4426 19.0805 51.4426 20.7802C51.4426 22.4799 50.8971 23.2452 49.8227 23.2452Z" fill="currentColor"/>
                  <path d="M50.0564 27.0457C50.3845 25.5257 51.7736 24.5801 53.5949 24.5801C55.9266 24.5801 57.0917 25.7945 57.0933 27.9097V33.1129C57.0933 33.3769 56.9525 33.5225 56.6852 33.5225H55.6002C55.3537 33.5225 55.1889 33.3993 55.1488 33.1529L55.0256 32.4969C54.5167 33.2361 53.6765 33.6681 52.6346 33.6681C50.8966 33.6681 49.7539 32.6361 49.7539 31.0329C49.7539 29.1625 51.063 28.1977 53.8253 28.1977H54.968V27.8681C54.968 26.7369 54.4959 26.1609 53.5981 26.1609C52.8811 26.1609 52.473 26.4697 52.2681 27.1289C52.1849 27.3977 52.0409 27.4985 51.8168 27.4985H50.4245C50.1396 27.4985 49.9956 27.3145 50.0564 27.0457ZM53.23 32.0841C54.2718 32.0841 54.968 31.4505 54.968 29.9273V29.6393H53.9037C52.6138 29.6393 51.9625 30.0713 51.9609 30.9545C51.9625 31.6537 52.473 32.0841 53.23 32.0841Z" fill="currentColor"/>
                  <path d="M2.63609 33.5266C2.39123 33.5266 2.24719 33.4242 2.16717 33.1778C1.20373 30.5058 0.550766 27.8514 0.00022929 25.1794C-0.0621861 24.9122 0.0610445 24.7266 0.345916 24.7266H1.67585C1.92231 24.7266 2.08395 24.8498 2.12716 25.0754C2.47285 26.9682 2.88415 28.9202 3.43628 30.8338L5.03028 25.0754C5.09109 24.8498 5.25433 24.7266 5.4992 24.7266H7.29964C7.5445 24.7266 7.70774 24.8498 7.76856 25.0754L9.36255 30.8338C9.91469 28.9218 10.326 26.9682 10.6717 25.0754C10.7117 24.8498 10.8781 24.7266 11.123 24.7266H12.4529C12.7378 24.7266 12.8594 24.9106 12.7986 25.1794C12.2481 27.8514 11.5951 30.5058 10.6317 33.1778C10.5484 33.4242 10.4076 33.5266 10.1628 33.5266H8.66478C8.44072 33.5266 8.25668 33.4242 8.19586 33.1778L6.39702 26.8434L4.59817 33.1778C4.53736 33.4242 4.35331 33.5266 4.12926 33.5266H2.63609Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.114 24.5839C15.6189 24.5839 13.8809 26.3935 13.8809 29.1279C13.8809 31.8623 15.6189 33.6719 18.114 33.6719C20.609 33.6719 22.347 31.8415 22.347 29.1279C22.347 26.4143 20.609 24.5839 18.114 24.5839ZM20.1369 29.3727C20.1369 31.1823 19.3399 32.2111 18.114 32.2111C16.8881 32.2111 16.0911 31.1823 16.0911 29.3727V28.8799C16.0911 27.0703 16.8881 26.0415 18.114 26.0415C19.3399 26.0415 20.1369 27.0703 20.1369 28.8799V29.3727Z" fill="currentColor"/>
                  <path d="M61.6838 33.3381C60.3746 31.0981 59.2432 28.2213 58.5294 25.1797C58.4686 24.8901 58.6126 24.7269 58.8991 24.7285H60.229C60.4739 24.7285 60.6387 24.8517 60.6787 25.0981C61.1076 27.2373 61.783 29.3141 62.6408 31.0405C63.3978 29.1477 64.094 27.1749 64.462 25.0981C64.5037 24.8517 64.6669 24.7285 64.9118 24.7285H66.2817C66.5666 24.7285 66.7106 24.9141 66.6274 25.2005C65.6863 28.9637 64.3372 32.2309 63.1721 34.7397C62.4151 36.3637 61.5349 37.0021 59.9409 37.0021C59.6353 37.0021 59.3104 36.9397 59.0431 36.8789C58.7982 36.8181 58.6974 36.6517 58.6974 36.4261V35.4389C58.6974 35.1509 58.8639 35.0469 59.1487 35.1301C59.3936 35.1909 59.6385 35.2309 59.8625 35.2309C60.8035 35.2309 61.1316 34.6149 61.6838 33.3381Z" fill="currentColor"/>
                  <path d="M26.276 25.8374C26.7257 25.1158 27.5227 24.623 28.443 24.623C28.7902 24.623 29.0959 24.7062 29.3424 24.8918C29.4256 24.9542 29.4864 25.0374 29.4864 25.1606V26.375C29.4864 26.6614 29.3648 26.7446 29.0575 26.6214C28.8078 26.5158 28.563 26.4758 28.2781 26.4758C27.033 26.4758 26.316 27.3606 26.316 28.6374L26.3176 33.1206C26.3176 33.3846 26.1768 33.527 25.9095 33.527H24.5972C24.3331 33.527 24.1891 33.3862 24.1891 33.1174L24.1875 25.1382C24.1875 24.8742 24.3283 24.7286 24.5956 24.7286H25.6807C25.9479 24.7286 26.092 24.8726 26.132 25.0982L26.276 25.8374Z" fill="currentColor"/>
                  <path d="M38.5464 33.0363C37.6486 31.1867 36.7892 29.9115 35.5825 28.7387L38.4056 25.2427C38.6105 24.9531 38.5096 24.7275 38.1816 24.7275H36.7108C36.5059 24.7275 36.3219 24.8075 36.1987 24.9531L33.3356 28.6123V21.1707C33.3356 20.9018 33.1915 20.7578 32.9243 20.7578H31.6151C31.3511 20.7578 31.207 20.9034 31.207 21.1707V33.1179C31.207 33.3835 31.3479 33.5275 31.6151 33.5275H32.9243C33.1883 33.5275 33.3324 33.3851 33.3324 33.1179L33.3356 29.0891C34.6031 30.3211 35.4817 31.6363 36.2163 33.2811C36.2995 33.4267 36.5011 33.5275 36.706 33.5275H38.3208C38.6473 33.5291 38.7097 33.3659 38.5464 33.0363Z" fill="currentColor"/>
                  <path d="M18.7716 13.3509C22.7822 9.33493 28.1179 7.12373 33.7961 7.12373C39.4631 7.12373 44.7924 9.33013 48.7998 13.3365C51.0916 15.6277 52.7928 18.3493 53.8315 21.3205C53.8763 21.4485 53.9947 21.5333 54.1307 21.5333H55.7055C55.92 21.5333 56.0752 21.3253 56.008 21.1205C54.8861 17.6565 52.9512 14.4837 50.3026 11.8341C45.8951 7.42613 40.0329 5 33.7993 5C27.5546 5 21.6811 7.43253 17.2688 11.8501C14.625 14.4965 12.6965 17.6645 11.5778 21.1205C11.5122 21.3253 11.6658 21.5333 11.8819 21.5333H13.4567C13.5927 21.5333 13.7111 21.4469 13.756 21.3205C14.7898 18.3573 16.4862 15.6389 18.7716 13.3509Z" fill="currentColor"/>
                  <path d="M57.9747 16.9867C56.4564 16.9867 55.2981 17.7759 55.0243 19.0442C54.9735 19.2682 55.0938 19.4217 55.3313 19.4217H56.4917C56.6784 19.4217 56.7987 19.3377 56.8681 19.1137C57.0393 18.564 57.3794 18.3058 57.9767 18.3058C58.7255 18.3058 59.1196 18.786 59.1196 19.7297V20.0045H58.1665C55.8633 20.0045 54.7713 20.8092 54.7713 22.37C54.7713 23.7077 55.7243 24.5685 57.173 24.5685C58.0421 24.5685 58.7421 24.2076 59.1673 23.5916L59.2699 24.1391C59.3031 24.3445 59.441 24.4471 59.6464 24.4471H60.5507C60.7736 24.4471 60.8908 24.3258 60.8908 24.1049V19.7639C60.8898 17.9988 59.9181 16.9867 57.9736 16.9867H57.9747ZM59.1196 21.448C59.1196 22.7184 58.5388 23.2473 57.6698 23.2473C110.912 23.2473 110.273 22.8885 110.273 22.3046C110.273 21.5683 57.1564 21.2074 58.2318 21.2074H59.1196V21.448Z" fill="currentColor"/>
                  <path d="M68.5516 17.1091H67.4088C67.2045 17.1091 67.0687 17.2117 67.0344 17.4171C66.7275 19.15 66.1467 20.7957 65.5162 22.3741C64.8007 20.9337 64.2376 19.2008 63.8798 17.4171C63.8466 17.2117 63.7087 17.1091 63.5044 17.1091H62.3958C62.1573 17.108 62.037 17.2439 62.0878 17.4855C62.683 20.0231 63.6267 22.4228 64.7177 24.2916C64.2573 25.3566 63.9835 25.871 63.1995 25.871C63.0128 25.871 62.8085 25.8378 62.6042 25.787C62.3667 25.7175 62.2278 25.8046 62.2278 26.0442V26.8676C62.2278 27.0553 62.3118 27.1943 62.5161 27.2451C62.739 27.2959 63.0097 27.3477 63.2648 27.3477C64.5943 27.3477 65.3275 26.8147 65.959 25.4603C66.9307 23.3676 68.0559 20.6412 68.8399 17.5021C68.9094 17.2636 68.7891 17.108 68.5516 17.108V17.1091Z" fill="currentColor"/>
                  <path d="M4.03529 14.3671L0.442993 24.4491H1.82018L2.77114 21.6948H6.96077L7.92625 24.4491H9.36048L5.78166 14.3671H4.03529ZM3.15484 20.5717L4.87322 15.6302L6.59159 20.5717H3.15484Z" fill="currentColor"/>
                  <path d="M76.5624 23.6112C75.1427 23.6112 74.4604 22.234 74.4604 20.7708C74.4604 19.3075 75.1137 17.9169 76.5759 17.9169C77.4844 17.9169 78.0952 18.4426 78.3223 19.2515H79.6144C79.3593 17.6752 77.9956 16.8663 76.6039 16.8663C74.5164 16.8663 73.0821 18.4281 73.0821 20.7718C73.0821 23.1155 74.5018 24.6628 76.6039 24.6628C77.9956 24.6628 79.4018 23.8819 79.6715 22.178H78.3368C78.1097 23.1155 77.4418 23.6123 76.5614 23.6123L76.5624 23.6112Z" fill="currentColor"/>
                  <path d="M84.131 16.8654C82.0154 16.8654 80.5522 18.4697 80.5522 20.7843C80.5522 23.099 82.0144 24.6608 84.131 24.6608C86.2476 24.6608 87.7658 23.0565 87.7658 20.7843C87.7658 18.5122 86.2745 16.8654 84.131 16.8654ZM84.131 23.6113C82.7673 23.6113 81.9304 22.4322 81.9304 20.7854C81.9304 19.1385 82.7683 17.9169 84.131 17.9169C85.4937 17.9169 86.4031 19.1095 86.4031 20.7854C86.4031 22.4612 85.5372 23.6113 84.131 23.6113Z" fill="currentColor"/>
                  <path d="M96.7976 16.8654C95.7751 16.8654 95.0222 17.4471 94.625 18.172C94.2983 17.4057 93.5745 16.8654 92.5229 16.8654C91.4714 16.8654 90.79 17.4337 90.4354 18.1295V17.107H89.1857V24.4482H90.5204V19.8614C90.5204 18.7113 91.1737 17.9304 92.1112 17.9304C93.1047 17.9304 93.5174 18.6688 93.5174 19.6913V24.4482H94.8521V19.8334C94.8521 18.7538 95.4909 17.9304 96.4854 17.9304C97.4229 17.9304 97.8917 18.6117 97.8917 19.7618V24.4482H99.2263V19.4642C99.2263 17.8879 98.3884 16.8654 96.7976 16.8654Z" fill="currentColor"/>
                  <path d="M104.763 16.9089C103.613 16.9089 102.76 17.4057 102.278 18.3857V17.108H101.028V26.906H102.363V23.3987C102.832 24.1651 103.598 24.6483 104.748 24.6483C106.58 24.6483 107.929 23.1 107.929 20.7854C107.929 18.4707 106.609 16.9089 104.762 16.9089H104.763ZM104.48 23.5688C103.245 23.5688 102.307 22.5608 102.307 20.7854C102.307 19.01 103.245 17.9449 104.494 17.9449C105.744 17.9449 106.567 19.095 106.567 20.7854C106.567 22.4757 105.715 23.5688 104.48 23.5688Z" fill="currentColor"/>
                  <path d="M112.133 16.8518C110.472 16.8518 109.477 17.7893 109.222 18.9394H110.529C110.699 18.3576 111.21 17.8598 112.133 17.8598C113.155 17.8598 113.794 18.3991 113.794 19.5066V19.8903C110.3 19.9899 108.98 20.8983 108.98 22.5317C108.98 23.8808 110.159 24.6617 111.507 24.6617C112.587 24.6617 113.425 24.2075 113.879 23.4266V24.4491H115.086V19.5077C115.086 17.8888 114.036 16.8518 112.133 16.8518ZM113.794 21.7228C113.794 22.9299 112.899 23.6537 111.736 23.6537C110.912 23.6537 110.273 23.157 110.273 22.4321C110.273 21.4386 111.267 20.8838 113.795 20.8278V21.7228H113.794Z" fill="currentColor"/>
                  <path d="M120.425 16.8653C119.388 16.8653 118.579 17.3486 118.138 18.1865V17.1069H116.889V24.4481H118.223V19.9038C118.223 18.8388 119.004 17.9438 120.027 17.9438C121.049 17.9438 121.66 18.5971 121.66 19.8748V24.4471H123.009V19.5906C123.009 17.9573 122.101 16.8643 120.425 16.8643V16.8653Z" fill="currentColor"/>
                  <path d="M129.258 17.1069L127.298 23.1985L125.31 17.1069H123.903L126.63 24.9169C126.318 25.8823 126.061 26.0535 125.395 26.0535C125.225 26.0535 124.997 26.0255 124.869 25.9829V27.048C125.068 27.105 125.31 27.133 125.55 27.133C126.687 27.133 127.283 26.6788 127.723 25.4001L130.591 17.1069H129.257H129.258Z" fill="currentColor"/>
                </g>
                <defs>
                  <clipPath id="clip0_2265_5035">
                    <rect width="131" height="28" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="col-span-2">
            <p className="text-sm text-black/60">
              © Sana Labs AB <span>2026</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="col-span-6 col-start-7">
            <ul className="flex items-center gap-6 flex-wrap">
              <li><a href="https://www.linkedin.com/company/sana-labs" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">LinkedIn</a></li>
              <li><a href="https://www.instagram.com/sanalabs/" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">Instagram</a></li>
              <li><a href="https://x.com/sanalabs" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">X</a></li>
              <li><a href="https://www.youtube.com/@SanaLabs" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 hover:opacity-60 transition-opacity">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

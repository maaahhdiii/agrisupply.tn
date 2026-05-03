import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'

  return (
    <div className="mx-auto max-w-md pt-12 pb-24">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          {isAr ? 'إنشاء حساب جديد' : 'Créer un compte'}
        </h1>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/market'); }}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.name')}
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {isAr ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
          
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            {isAr ? 'تسجيل' : 'S\'inscrire'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600">
          {isAr ? 'لديك حساب بالفعل؟ ' : 'Déjà un compte? '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {isAr ? 'دخول' : 'Connexion'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

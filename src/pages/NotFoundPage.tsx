import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 sm:text-7xl lg:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t('notFound.title')}
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          {t('notFound.subtitle')}
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/')}>
            {t('notFound.goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Plus, User, Mail, Shield, Calendar } from 'lucide-react';
import { localDb } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import type { User as UserType } from '../../types';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await localDb.users.toArray();
    setUsers(allUsers);
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newWorker: UserType = {
        id: `worker-${Date.now()}`,
        email,
        role: 'worker',
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await localDb.users.add(newWorker);
      await loadUsers();

      setEmail('');
      setPassword('');
      setName('');
      setShowAddModal(false);
    } catch (err) {
      setError(t.users.failedCreate);
    } finally {
      setLoading(false);
    }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const workers = users.filter((u) => u.role === 'worker');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.users.title}</h1>
          <p className="text-gray-500 mt-1">
            {t.users.usersTotal.replace('{count}', String(users.length))}
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          {t.users.addWorker}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'fr' ? 'Administrateurs' : 'Administrators'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => (
              <UserCard
                key={admin.id}
                user={admin}
                isCurrentUser={admin.id === currentUser?.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'fr' ? 'Employes' : 'Workers'}
          </h2>
          {workers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <UserCard key={worker.id} user={worker} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'fr' ? 'Aucun employe' : 'No workers yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {language === 'fr'
                  ? "Ajoutez des comptes employes pour que votre equipe puisse gerer l'inventaire"
                  : 'Add worker accounts to let your team manage inventory'}
              </p>
              <Button onClick={() => setShowAddModal(true)}>{t.users.addWorker}</Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEmail('');
          setPassword('');
          setName('');
          setError('');
        }}
        title={t.users.addWorker}
        size="md"
      >
        <form onSubmit={handleCreateWorker} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.users.workerName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.users.workerName}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.common.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.common.enterEmail}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.common.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.common.enterPassword}
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'fr' ? 'Minimum 6 caracteres' : 'Minimum 6 characters'}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              {language === 'fr'
                ? "Les employes peuvent ajouter des produits, effectuer des ventes et voir leur historique de ventes. Ils ne peuvent pas modifier/supprimer des produits ni gerer les utilisateurs."
                : 'Workers can add products, make sales, and view their own sales history. They cannot edit/delete products or manage users.'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setEmail('');
                setPassword('');
                setName('');
                setError('');
              }}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {language === 'fr' ? "Creer l'employe" : 'Create Worker'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface UserCardProps {
  user: UserType;
  isCurrentUser?: boolean;
}

function UserCard({ user, isCurrentUser }: UserCardProps) {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            user.role === 'admin' ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <User
            className={`w-6 h-6 ${
              user.role === 'admin' ? 'text-blue-600' : 'text-gray-600'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.name}
            </h3>
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {language === 'fr' ? 'Vous' : 'You'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Mail className="w-4 h-4" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Shield className="w-4 h-4" />
            <span className="capitalize">
              {user.role === 'admin' ? t.auth.admin : t.auth.worker}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
            <Calendar className="w-3 h-3" />
            <span>
              {t.users.joined} {new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

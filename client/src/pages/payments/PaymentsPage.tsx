import React, { useState, useEffect } from 'react';
import nexusApi from '../../api/nexusApi';
import { CreditCard, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  description: string;
  toUser?: { name: string; email: string };
  createdAt: string;
}

type Tab = 'overview' | 'deposit' | 'withdraw' | 'transfer';

export const PaymentsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [depositForm, setDepositForm] = useState({ amount: '', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', description: '' });
  const [transferForm, setTransferForm] = useState({ toUserEmail: '', amount: '', description: '' });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await nexusApi.get('/payments/history');
      setTransactions(data.transactions);
      setBalance(data.balance);
    } catch {
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const { data } = await nexusApi.post('/payments/deposit', depositForm);
      setSuccess(`Deposit of $${depositForm.amount} successful!`);
      setDepositForm({ amount: '', description: '' });
      fetchHistory();
      setTab('overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Deposit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await nexusApi.post('/payments/withdraw', withdrawForm);
      setSuccess(`Withdrawal of $${withdrawForm.amount} successful!`);
      setWithdrawForm({ amount: '', description: '' });
      fetchHistory();
      setTab('overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await nexusApi.post('/payments/transfer', transferForm);
      setSuccess(`Transfer of $${transferForm.amount} sent!`);
      setTransferForm({ toUserEmail: '', amount: '', description: '' });
      fetchHistory();
      setTab('overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const txIcon = (type: string) =>
    type === 'deposit' ? <ArrowDownCircle className="w-4 h-4 text-green-500" /> :
    type === 'withdraw' ? <ArrowUpCircle className="w-4 h-4 text-red-500" /> :
    <ArrowLeftRight className="w-4 h-4 text-blue-500" />;

  const statusBadge = (status: string) => (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      status === 'Completed' ? 'bg-green-100 text-green-700' :
      status === 'Failed' ? 'bg-red-100 text-red-700' :
      'bg-yellow-100 text-yellow-700'
    }`}>
      {status === 'Completed' ? <CheckCircle className="w-3 h-3" /> :
       status === 'Failed' ? <XCircle className="w-3 h-3" /> :
       <Clock className="w-3 h-3" />}
      {status}
    </span>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Payments
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your investment transactions (Sandbox)</p>
        </div>
        <button onClick={fetchHistory} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <p className="text-indigo-200 text-sm font-medium">Available Balance</p>
        <p className="text-4xl font-bold mt-1">${balance}</p>
        <p className="text-indigo-200 text-xs mt-2">Sandbox simulation — no real money</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {[
          { key: 'overview', label: 'History', icon: <Clock className="w-4 h-4" /> },
          { key: 'deposit', label: 'Deposit', icon: <ArrowDownCircle className="w-4 h-4" /> },
          { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpCircle className="w-4 h-4" /> },
          { key: 'transfer', label: 'Transfer', icon: <ArrowLeftRight className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as Tab); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Transaction History */}
      {tab === 'overview' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              No transactions yet. Make a deposit to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx._id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {txIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}
                        {tx.toUser && <span className="text-gray-500 font-normal"> → {tx.toUser.name}</span>}
                      </p>
                      <p className="text-xs text-gray-500">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {statusBadge(tx.status)}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposit Form */}
      {tab === 'deposit' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
            Deposit Funds
          </h2>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input type="number" min="0.01" step="0.01"
                value={depositForm.amount}
                onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="1000.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text"
                value={depositForm.description}
                onChange={e => setDepositForm({ ...depositForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Investment capital..." />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition">
              {submitting ? 'Processing...' : 'Deposit'}
            </button>
          </form>
        </div>
      )}

      {/* Withdraw Form */}
      {tab === 'withdraw' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-red-500" />
            Withdraw Funds
          </h2>
          <p className="text-sm text-gray-500 mb-4">Available: <strong>${balance}</strong></p>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input type="number" min="0.01" step="0.01" max={balance}
                value={withdrawForm.amount}
                onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="500.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text"
                value={withdrawForm.description}
                onChange={e => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Withdrawal reason..." />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition">
              {submitting ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </div>
      )}

      {/* Transfer Form */}
      {tab === 'transfer' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
            Transfer to User
          </h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
              <input type="email"
                value={transferForm.toUserEmail}
                onChange={e => setTransferForm({ ...transferForm, toUserEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="investor@nexus.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input type="number" min="0.01" step="0.01"
                value={transferForm.amount}
                onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="2500.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text"
                value={transferForm.description}
                onChange={e => setTransferForm({ ...transferForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Investment transfer..." />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition">
              {submitting ? 'Processing...' : 'Send Transfer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;

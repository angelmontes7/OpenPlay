import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { fetchAPI } from "../../../../lib/fetch";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

import './Dashboard.css';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Dashboard = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [totalProfitOrLoss, setTotalProfitOrLoss] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetchAPI(`/api/database/balance?clerkId=${user?.id}`, { method: 'GET' });
        if (response.balance !== undefined) setBalance(response.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetchAPI(`/api/database/transactions?clerkId=${user?.id}`, { method: 'GET' });
        if (response.transactions) {
          setTransactions(response.transactions);
          calculateProfitOrLoss(response.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchBalance();
    fetchTransactions();
  }, [user?.id]);

  const calculateProfitOrLoss = (transactions) => {
    let total = 0;

    transactions.forEach((transaction) => {
      // Ensure transaction.amount is treated as a number
      const amount = parseFloat(transaction.amount);
      
      // Check if the amount is a valid number
      if (isNaN(amount)) {
        console.error(`Invalid transaction amount: ${transaction.amount}`);
        return; // Skip this transaction if it's invalid
      }
  
      if (['wager_win', 'wager_refund'].includes(transaction.type)) {
        total += amount;
      } else if (['wager'].includes(transaction.type)) {
        total -= amount;
      }
    });
  
    setTotalProfitOrLoss(total);
  };

  const chartData = {
    labels: transactions.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Net Transaction Amount',
        data: transactions.map((t) => (
          ['add', 'wager_win', 'wager_refund'].includes(t.type) ? t.amount : -t.amount
        )),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="dashboard-subtitle">Manage your balance and track recent activity</p>
        </div>
        <div className="balance-card">
          <h4>Available Balance</h4>
          <span className="balance-amount">${balance}</span>
        </div>
      </div>

      <div className="metrics-cards">
        <div className="metric-card">
            <h5>Total Profit / Loss</h5>
            <span className={totalProfitOrLoss >= 0 ? "positive" : "negative"}>
            {totalProfitOrLoss >= 0 ? `+$${totalProfitOrLoss}` : `-$${Math.abs(totalProfitOrLoss)}`}
            </span>
            <p className={totalProfitOrLoss >= 0 ? "positive-message" : "negative-message"}>
            {totalProfitOrLoss >= 0
                ? "Great job! You're in the green. Keep going to make some serious money."
                : "If you wager the above amount and win your no longer in the red.... Do it."}
            </p>
        </div>
      </div>


      <div className="chart-section">
        <h3>Transactions Over Time</h3>
        {transactions.length > 0 ? <Line data={chartData} /> : <p>Loading chart...</p>}
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p>No recent transactions available.</p>
        ) : (
          <ul>
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id}>
                <div>{new Date(t.date).toLocaleDateString()}</div>
                <div className="transaction-type">{t.type.replace('_', ' ').toUpperCase()}</div>
                <div className={['add', 'wager_win', 'wager_refund'].includes(t.type) ? 'amount-positive' : 'amount-negative'}>
                  {['add', 'wager_win', 'wager_refund'].includes(t.type) ? '+' : '-'}${t.amount}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { fetchAPI } from "../../../../lib/fetch";
import './Transactions.css'

const Transaction = () => {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const transactionsPerPage = 6; // Number of transactions per page

  useEffect(() => {
    // Fetch balance and transactions when component mounts
    const fetchBalance = async () => {
      try {
        const response = await fetchAPI(`/api/database/balance?clerkId=${user?.id}`, {
          method: 'GET',
        });
        if (response.balance !== undefined) {
          setBalance(response.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetchAPI(`/api/database/transactions?clerkId=${user?.id}`, {
          method: 'GET',
        });
        if (response.transactions) {
          setTransactions(response.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchBalance();
    fetchTransactions();
  }, [user?.id]); // Fetch data whenever the user changes

  const getIconForTransactionType = (type) => {
    switch (type) {
      case 'add':
        return <i className="fa-solid fa-plus"></i>;
      case 'subtract':
        return <i className="fa-solid fa-minus"></i>;
      case 'wager':
        return <i className="fa-solid fa-money-bill"></i>;
      case 'wager_win':
        return <i className="fa-solid fa-medal" />;
      case 'wager_refund':
        return <i className="fa-solid fa-arrow-rotate-left"></i>;
      default:
        return <i className="fa-solid fa-question"></i>;
    }
  };

  const getTransactionBackgroundColor = (type) => {
    switch (type) {
      case 'add':
        return 'green'; 
      case 'subtract':
      case 'wager':
        return 'red'; 
      case 'wager_win':
        return 'yellow';
      case 'wager_refund':
        return 'blue'; 
      default:
        return 'gray'; 
    }
  };

  // Get current transactions for the current page
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="transactions">
      <div className="transaction-container">
        {/* Balance Section */}
        <div className="balance-section">
          <h2>Your Balance</h2>
          <div className="balance">
            <span>$</span>
            <span>{balance}</span>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="transactions-section">
          <h2>Transactions:</h2>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet. Download the app to begin wagering!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {currentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div 
                      className={`transaction-icon ${transaction.type}`}
                      style={{ backgroundColor: getTransactionBackgroundColor(transaction.type) }}
                    >
                      {getIconForTransactionType(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <h3 style={{ color: getTransactionBackgroundColor(transaction.type) }}>
                        {transaction.type}
                      </h3>
                      <p>{transaction.date}</p>
                    </div>
                  </div>
                  <div
                    className={`transaction-amount ${transaction.type === 'add' ? 'positive' : 'negative'}`}
                    style={{ color: getTransactionBackgroundColor(transaction.type) }}
                  >
                    {transaction.type === 'add' ? `+${transaction.amount}` : `-${transaction.amount}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {transactions.length > transactionsPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastTransaction >= transactions.length}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;

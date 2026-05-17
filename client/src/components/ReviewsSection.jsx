import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ReviewsSection.css';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');

  const fetchReviews = () => {
    setLoading(true);
    setTimeout(() => {
      const storedReviews = JSON.parse(localStorage.getItem('website_reviews') || '[]');
      storedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(storedReviews);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchReviews();
    
    // Listen for storage changes from other tabs (like Admin)
    const handleStorageChange = (e) => {
      if (e.key === 'website_reviews') fetchReviews();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const newReview = {
        id: Date.now(),
        rating,
        comment,
        reviewer_name: user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() : (guestName || 'Anonymous'),
        created_at: new Date().toISOString()
      };
      
      const existingReviews = JSON.parse(localStorage.getItem('website_reviews') || '[]');
      existingReviews.push(newReview);
      localStorage.setItem('website_reviews', JSON.stringify(existingReviews));
      
      // Manually trigger storage event for same window (Admin tab might be open)
      window.dispatchEvent(new Event('storage'));
      
      addToast('Review submitted successfully!');
      setShowModal(false);
      setComment('');
      setGuestName('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      addToast('Failed to submit review', 'error');
    }
  };

  return (
    <section className="section container reviews-section">
      <div className="section-header center">
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">Real experiences from our valued customers.</p>
      </div>

      <div className="reviews-summary flex items-center justify-between">
        <div className="flex gap-md items-center">
          <div className="stars">
             {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="var(--primary)" color="var(--primary)" />)}
          </div>
          <span className="font-bold text-lg">
            {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 5.0} / 5.0
          </span>
          <span className="text-gray-500">({reviews.length} reviews)</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MessageSquare size={18} /> Leave a Review
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="empty-reviews center">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.slice(0, 6).map(review => (
            <div key={review.id} className="review-card glass">
              <div className="stars mb-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "var(--primary)" : "none"} color={i < review.rating ? "var(--primary)" : "#ccc"} />
                ))}
              </div>
              <p className="review-comment">"{review.comment}"</p>
              <div className="review-author mt-md">
                <strong>{review.reviewer_name}</strong>
                <span className="text-sm text-gray-500 block">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Write a Review</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating-input">
                  {[...Array(5)].map((_, i) => (
                    <button type="button" key={i} onClick={() => setRating(i + 1)}>
                      <Star size={32} fill={i < rating ? "var(--primary)" : "none"} color={i < rating ? "var(--primary)" : "#ccc"} />
                    </button>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={guestName} 
                    onChange={e => setGuestName(e.target.value)} 
                    placeholder="Your Name (Optional)" 
                  />
                </div>
              )}

              <div className="form-group">
                <label>Comment</label>
                <textarea 
                  className="form-control" 
                  value={comment} 
                  onChange={e => setComment(e.target.value)} 
                  rows={4} 
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

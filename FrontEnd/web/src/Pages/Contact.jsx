import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageAction, selectContactLoading, selectContactSuccess, selectContactError, resetContactState } from "../Features/Contactslice";
import "../Pages/Contact.css";

import { toast } from 'react-toastify';

export default function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const dispatch = useDispatch();
  const loading = useSelector(selectContactLoading);
  const success = useSelector(selectContactSuccess);
  const error = useSelector(selectContactError);

  useEffect(() => {
    if (success) {
      toast.success("Your inquiry has been received. Our concierge will contact you shortly.");
      const bc = new BroadcastChannel('admin_updates');
      bc.postMessage('REFRESH_DATA');
      bc.close();

      reset();
      dispatch(resetContactState());
    }
    if (error) {
      toast.error("Inquiry failed: " + error);
      dispatch(resetContactState());
    }
  }, [success, error, reset, dispatch]);

  const onSubmit = (data) => {
    dispatch(sendMessageAction(data));
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-hero">
        <span className="premium-badge">Inquire Today</span>
        <h1 className="hero-title">Connect with <span>Excellence</span></h1>
        <p className="hero-subtitle">Begin your journey towards a legendary celebration. Our master planners are ready to assist you.</p>
      </div>

      <div className="contact-grid">
        {/* Contact Info Panel */}
        <div className="contact-visual-panel">
          <div className="info-glass-card">
            <div className="info-row">
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h3>Our Atelier</h3>
                <p>Majestic Estate, Block 4, Clifton, Karachi</p>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon">📞</div>
              <div className="info-text">
                <h3>Direct Concierge</h3>
                <p>+92 321 458796</p>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon">✉️</div>
              <div className="info-text">
                <h3>Email Inquiries</h3>
                <p>concierge@majestic-occasions.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-panel">
          <form className="luxury-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                })}
              />
              {errors.email && <span className="error-msg">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Phone Number"
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && <span className="error-msg">{errors.phone.message}</span>}
            </div>

            <div className="input-group">
              <textarea
                placeholder="Tell us about your event (Type, Date, Guests...)"
                rows="5"
                {...register("message", { required: "Message is required" })}
              ></textarea>
              {errors.message && <span className="error-msg">{errors.message.message}</span>}
            </div>

            <button type="submit" className="submit-luxury-btn" disabled={loading}>
              {loading ? "Transmitting..." : "Send Inquiry Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

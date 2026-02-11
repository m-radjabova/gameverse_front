import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../apiClient/apiClient";
import { toast } from "react-toastify";

function CheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const resendVerification = async () => {
    try {
      await apiClient.post("/mail/send-verify", { email });
      toast.success("Verification email has been resent!");
    } catch {
      toast.error("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-teal-600 mb-4">
          Verify Your Email
        </h2>

        <p className="text-slate-600 mb-6">
          A verification link has been sent to{" "}
          <strong>{email}</strong>.
          <br />
          Please check your inbox and click the link to activate your account.
        </p>

        <button
          onClick={resendVerification}
          className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 transition"
        >
          Resend Verification Email
        </button>

        <div className="mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-slate-500 underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckEmailPage;
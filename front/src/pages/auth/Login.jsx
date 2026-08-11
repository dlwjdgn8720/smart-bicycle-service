import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import { HOME_STATS } from "../../constants/mockData";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithKakao } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", keepLoggedIn: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === "keepLoggedIn" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "올바른 이메일 주소를 입력해주세요.";
    if (!form.password) next.password = "비밀번호를 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(form);
      navigate(ROUTES.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocial = async (provider) => {
    await provider();
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between border-b border-border p-10 lg:border-b-0 lg:border-r lg:p-16 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]">
        <Logo />
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-neon">라이더 커뮤니티</p>
          <h1 className="text-5xl font-extrabold leading-[1.1] sm:text-6xl">
            다시 달릴
            <br />
            <span className="text-neon">준비 됐나요?</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm text-gray-400">
            로그인하고 오늘의 루트를 확인하세요. 전국 50,000명의 라이더가 기다리고 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-8 border-t border-border pt-8">
          {HOME_STATS.slice(0, 2).map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-neon">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-10 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-white">로그인</h2>
          <p className="mt-2 text-sm text-gray-400">
            계정이 없으신가요?{" "}
            <Link to={ROUTES.SIGNUP} className="font-semibold text-neon">
              무료 가입
            </Link>
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button variant="dark" onClick={() => handleSocial(loginWithGoogle)}>
              <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[10px] font-bold text-black">G</span>
              Google로 계속하기
            </Button>
            <Button variant="dark" onClick={() => handleSocial(loginWithKakao)}>
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#FEE500] text-[10px] font-bold text-black">K</span>
              Kakao로 계속하기
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={Mail}
              type="email"
              placeholder="이메일 주소"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={form.keepLoggedIn}
                  onChange={handleChange("keepLoggedIn")}
                  className="h-4 w-4 rounded border-border bg-card accent-neon"
                />
                로그인 유지
              </label>
              <button type="button" className="text-gray-400 hover:text-white">
                비밀번호 찾기
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              로그인
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            로그인 시 PEDALUP의 <span className="underline">이용약관</span> 및{" "}
            <span className="underline">개인정보처리방침</span>에 동의하는 것으로 간주합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

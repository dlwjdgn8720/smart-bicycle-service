import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Check, ArrowRight } from "lucide-react";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const RIDING_STYLES = ["로드", "MTB", "그래벨", "투어링", "도심 라이딩"];
const CHECKLIST = [
  "AI 맞춤 루트 추천 무제한 이용",
  "라이딩 기록·통계 자동 저장",
  "전국 라이더 커뮤니티 참여",
  "매달 챌린지 & 리워드 참가",
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithKakao } = useAuth();
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    ridingStyles: [],
    agreeRequired: false,
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleStyle = (style) => {
    setForm((prev) => ({
      ...prev,
      ridingStyles: prev.ridingStyles.includes(style)
        ? prev.ridingStyles.filter((s) => s !== style)
        : [...prev.ridingStyles, style],
    }));
  };

  const validate = () => {
    const next = {};
    if (!form.nickname.trim()) next.nickname = "닉네임을 입력해주세요.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "올바른 이메일 주소를 입력해주세요.";
    if (form.password.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.passwordConfirm !== form.password) next.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!form.agreeRequired) next.agreeRequired = "필수 약관에 동의해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await signup(form);
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
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-neon">지금 바로 시작하세요</p>
          <h1 className="text-5xl font-extrabold leading-[1.1] sm:text-6xl">
            당신의
            <br />
            <span className="text-neon">첫 라이딩을</span>
            <br />
            기록하세요
          </h1>
          <p className="mt-6 max-w-sm text-sm text-gray-400">
            무료 가입 후 전국 12,800개 루트를 탐색하고, 라이더들과 함께 달리세요.
          </p>
          <ul className="mt-6 space-y-2.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="h-4 w-4 text-neon" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-8 border-t border-border pt-8">
          <div>
            <p className="text-2xl font-extrabold text-neon">무료</p>
            <p className="mt-1 text-xs text-gray-500">영구 무료 플랜</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-neon">30초</p>
            <p className="mt-1 text-xs text-gray-500">가입 소요 시간</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-10 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-white">무료 가입</h2>
          <p className="mt-2 text-sm text-gray-400">
            이미 계정이 있으신가요?{" "}
            <Link to={ROUTES.LOGIN} className="font-semibold text-neon">
              로그인
            </Link>
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button variant="dark" onClick={() => handleSocial(loginWithGoogle)}>
              <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[10px] font-bold text-black">G</span>
              Google로 가입
            </Button>
            <Button variant="dark" onClick={() => handleSocial(loginWithKakao)}>
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#FEE500] text-[10px] font-bold text-black">K</span>
              Kakao로 가입
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
            <span className="h-px flex-1 bg-border" />
            또는 이메일로 가입
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input icon={User} placeholder="이름 (닉네임)" value={form.nickname} onChange={handleChange("nickname")} error={errors.nickname} />
            <Input icon={Mail} type="email" placeholder="이메일 주소" value={form.email} onChange={handleChange("email")} error={errors.email} />
            <Input icon={Lock} type="password" placeholder="비밀번호 (8자 이상)" value={form.password} onChange={handleChange("password")} error={errors.password} />
            <Input icon={Lock} type="password" placeholder="비밀번호 확인" value={form.passwordConfirm} onChange={handleChange("passwordConfirm")} error={errors.passwordConfirm} />

            <div>
              <p className="mb-2 text-sm text-gray-400">라이딩 스타일 (선택)</p>
              <div className="flex flex-wrap gap-2">
                {RIDING_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      form.ridingStyles.includes(style)
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-border text-gray-400 hover:border-white/30"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.agreeRequired}
                  onChange={(e) => setForm((p) => ({ ...p, agreeRequired: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-card accent-neon"
                />
                <span>
                  <span className="font-bold text-white">[필수]</span> 이용약관 및 개인정보처리방침에 동의합니다
                </span>
              </label>
              {errors.agreeRequired && <p className="text-xs text-danger">{errors.agreeRequired}</p>}
              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.agreeMarketing}
                  onChange={(e) => setForm((p) => ({ ...p, agreeMarketing: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-card accent-neon"
                />
                <span>
                  <span className="font-bold text-white">[선택]</span> 이벤트·혜택 마케팅 정보 수신에 동의합니다
                </span>
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            가입 시 PEDALUP의 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>을 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

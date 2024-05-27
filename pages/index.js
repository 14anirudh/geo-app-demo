import Image from "next/image";
import { Inter } from "next/font/google";
import RegisterForm from "@/components/RegisterForm";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <RegisterForm/>
  );
}

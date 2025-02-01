import Image from "next/image";
import { auth, login, logout } from "../actions";

export default async function Home() {
  const subject = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="flex flex-col items-center justify-center p-4">
        <Image
          className="w-44 h-auto mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-decimal mb-4">
          {subject ? (
            <>
              <li>
                Logged in as <code>{subject.properties.id}</code>.
              </li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          ) : (
            <>
              <li>Login with your email and password.</li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          )}
        </ol>

        <div className="flex space-x-4">
          {subject ? (
            <form action={logout}>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                Logout
              </button>
            </form>
          ) : (
            <form action={login}>
              <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Login with OpenAuth
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

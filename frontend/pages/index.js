import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, Badge } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    try {
      const fetchJobs = async (ind) => {
        try {
          const res = await fetch('/api/jobs');
          const data = await res.json();
          const sortedItems = data.jobs.sort((a, b) => new Date(b.date) - new Date(a.date));
          setJobs(sortedItems);
          setLoading(false)
        }
        catch (e) {
          if (ind > 0) fetchJobs(ind - 1)
        }
      };
      fetchJobs(3);
    }
    catch (e) {
      console.log(e)
    }
    console.info("%cIf you can see this, tell me here - linkedin.com/in/om-srivastava", "font-weight: bold; font-size: 20px;color:blue")

  }, []);
  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-600">
      <h1 className="text-4xl font-bold mb-8 text-center">Job listings for freshers</h1>
      <h3 className="text-xl font-bold mb-8 text-center">Updated using AI everyday. Apply first and never miss any application.</h3>
      <div className="container mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? <div>Loading...</div> :
          jobs && jobs.map((job) => {
            return <Card key={job._id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-2 flex flex-col justify-between ">
                <div>
                  <h3 className="text-lg font-semibold">{job.company}</h3>
                  <p className="text-muted-foreground">{job.title}</p>
                  <p className="text-muted-foreground">Job ID - {job._id}</p>
                </div>
                <div className="flex items-center justify-between text-blue-500">
                  <p className="text-muted-foreground">Updated: {new Date(job.date).toLocaleDateString()}</p>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    prefetch={false}
                  >
                    <span className="text-blue-500">Apply</span>
                    <ArrowRightIcon className="w-4 h-4 text-blue-500" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          })
        }
      </div>
      <h3 className="w-full text-center mt-10">Made by - (<Link href={'https://linkedin.com/in/om-srivastava'} className="text-blue-500 hover:underline hover:animate-bounce transition-all">Om Srivastava</Link>)</h3>

    </div>
  );
}

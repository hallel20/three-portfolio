import { Code, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUIStore } from "@/lib/store";

export default function AboutDialog() {
  const { aboutOpen, setAboutOpen } = useUIStore();
  return (
    <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-black/50 border-cyan-400/30 text-white hover:bg-cyan-400/10 backdrop-blur-sm"
        >
          <User className="w-4 h-4 mr-2" />
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900/95 border-cyan-400/30 text-white backdrop-blur-md max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">About Me</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Software Developer</h3>
              <p className="text-gray-300">
                Passionate about ellaborate software solutions and immersive web
                experiences.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-black/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Skills & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "Next.js",
                    "Three.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Node.js",
                    "Python",
                  ].map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-cyan-400">Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">
                    Software Developer
                  </h4>
                  <p className="text-sm text-gray-400">2022 - Present</p>
                  <p className="text-gray-300">
                    Building and refactoring web and native applications with a
                    focus on performance and user experience.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Web developer</h4>
                  <p className="text-sm text-gray-400">2020 - 2022</p>
                  <p className="text-gray-300">
                    Developed stunning websites and applications using modern
                    web technologies, focusing on responsive design and
                    accessibility.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

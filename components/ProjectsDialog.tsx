import { Calendar, ExternalLink, FolderOpen, Github, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { usePortfolioStore, useUIStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function ProjectsDialog() {
  const { projectsOpen, setProjectsOpen } = useUIStore();
  const { selectedCategory, setSelectedCategory, projects } = usePortfolioStore();

  const categories = {
    all: "All Projects",
    web: "Web Development",
    mobile: "Mobile Apps",
    openSource: "Open Source",
  };

  return (
    <Dialog open={projectsOpen} onOpenChange={setProjectsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-black/50 border-cyan-400/30 text-white hover:bg-cyan-400/10 backdrop-blur-sm"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Projects
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900/95 border-cyan-400/30 text-white backdrop-blur-md max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">
            My Projects
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 bg-black/30">
              {Object.entries(categories).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {projects
                .filter(
                  (project) =>
                    selectedCategory === "all" ||
                    project.category === selectedCategory
                )
                .map((project) => (
                  <Card
                    key={project.id}
                    className="bg-black/40 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-1/3 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-48 lg:h-full object-cover"
                        />
                        {project.featured && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <div
                          className="absolute top-2 right-2 w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        ></div>
                      </div>

                      <div className="lg:w-2/3 p-6">
                        <CardHeader className="p-0 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl text-white mb-2">
                                {project.title}
                              </CardTitle>
                              <CardDescription className="text-gray-300 text-sm mb-3">
                                {project.description}
                              </CardDescription>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 ml-4">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            {project.longDescription}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="border-cyan-400/50 text-cyan-300 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                              onClick={() =>
                                window.open(project.liveUrl, "_blank")
                              }
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Live Demo
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={() =>
                                window.open(project.githubUrl, "_blank")
                              }
                            >
                              <Github className="w-3 h-3 mr-1" />
                              Source
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

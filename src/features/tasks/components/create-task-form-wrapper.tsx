import { Loader } from 'lucide-react'

import { useGetMembers } from '@/features/members/api/use-get-members'
import { useGetProjects } from '@/features/projects/api/use-get-projects'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'

import { Card, CardContent } from '@/components/ui/card'

import { CreateTaskForm } from './create-task-form'

interface CreateTaskFormWrapperProps {
  onCancel: () => void
}

export const CreateTaskFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId()

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  })
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  })

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }))

  const memberOptions = members?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
  }))

  const isLoading = isLoadingProjects || isLoadingMembers

  if (isLoading) {
    return (
      <Card className="h-[714px] w-full border-none shadow-none">
        <CardContent className="flex h-full items-center justify-center">
          <Loader className="text-muted-foreground size-5 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <CreateTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? []}
    />
  )
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-return */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IBoard, IProject, ISprint, IStatus, IUserInfo } from '../types';
import { getOwner } from '../utils/helpers';
import { getProjectDetails } from '../api/projects/projects';

export interface IProjectDetails {
  labels: any;
  ticketTypes: any;
  sprints: ISprint[];
  epics: any;
  users: IUserInfo[];
  statuses: IStatus[];
  boards: IBoard[];
  details: IProject;
  retroBoards: any;
  isLoadingDetails: boolean;
  onUpsertSprint: (item: any) => void;
  onUpdateSprint: (id: string, item: any) => void;
  onRemoveSprint: (itemId: string) => void;
  onUpsertEpic: (item: any) => void;
  onUpdateEpic: (id: string, item: any) => void;
  onRemoveEpic: (itemId: string) => void;
}

const ProjectDetailsContext = createContext<IProjectDetails>({
  labels: [],
  ticketTypes: [],
  sprints: [],
  epics: [],
  users: [],
  statuses: [],
  boards: [],
  retroBoards: [],
  details: {
    id: '',
    name: '',
    iconUrl: '',
    updateAt: new Date(),
    roles: [],
    defaultRetroBoard: '',
    shortcut: [
      {
        id: '',
        name: '',
        shortcutLink: ''
      }
    ]
  },
  isLoadingDetails: true,
  onRemoveSprint: (itemId: string) => {
    return;
  },
  onUpsertSprint: (item: any) => {
    return;
  },
  onUpdateSprint: (id: string, item: any) => {
    return;
  },
  onUpsertEpic: (item: any) => {
    return;
  },
  onUpdateEpic: (id: string, item: any) => {
    return;
  },
  onRemoveEpic: (itemId: string) => {
    return;
  }
});
const ProjectDetailsDispatchContext = createContext<Dispatch<SetStateAction<IProjectDetails>>>(
  () => {}
);

interface IProjectDetailsProvider {
  children?: React.ReactNode;
}

function ProjectDetailsProvider({ children }: IProjectDetailsProvider) {
  const [details, setDetails] = useState<any>({
    labels: [],
    ticketTypes: [],
    sprints: [],
    epics: [],
    users: [],
    statuses: [],
    boards: [],
    retroBoards: [],
    details: {
      id: '',
      name: '',
      iconUrl: '',
      updateAt: new Date(),
      roles: [],
      defaultRetroBoard: '',
      shortcut: []
    },
    isLoadingDetails: true,
    onRemoveSprint: () => {},
    onUpsertSprint: () => {},
    onUpdateSprint: () => {},
    onUpsertEpic: () => {},
    onUpdateEpic: () => {},
    onRemoveEpic: () => {}
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const { projectId = null } = useParams();

  const fetchProjectDetails = async () => {
    if (!projectId) {
      return;
    }
    try {
      setIsLoadingDetails(true);
      const res = await getProjectDetails(projectId);
      setDetails({
        labels: res.data.labels,
        ticketTypes: res.data.ticketTypes,
        sprints: res.data.sprints,
        epics: res.data.epics,
        statuses: [
          ...res.data.statuses,
          {
            id: null,
            slug: null,
            tenantId: null,
            isDefault: false,
            name: 'Backlog'
          }
        ],
        boards: res.data.boards,
        users: [...res.data.users, getOwner(projectId) ?? []],
        details: res.data.details,
        retroBoards: res.data.retroBoards,
        shortcut: res.data.shortcut
      });
      setIsLoadingDetails(false);
    } catch (e) {
      console.error('err');
      setIsLoadingDetails(false);
    }
  };

  const onUpdateSprint = (id, sprint: any) => {
    const updatedSprint = {
      sprints: details.sprints.map((item) => (id === item.id ? sprint : item))
    };
    setDetails({ ...details, ...updatedSprint });
  };

  const onUpsertSprint = (sprint: any) => {
    const updatedSprint = { sprints: [...details.sprints, ...[sprint]] };
    setDetails({ ...details, ...updatedSprint });
  };

  const onRemoveSprint = (sprintId: any) => {
    const updatedSprint = { sprints: details.sprints.filter((item) => item.id !== sprintId) };
    setDetails({ ...details, ...updatedSprint });
  };

  const onUpsertEpic = (epic: any) => {
    const updatedEpic = { epics: [...details.epics, ...[epic]] };
    setDetails({ ...details, ...updatedEpic });
  };

  const onUpdateEpic = (id, epic: any) => {
    const updatedEpic = {
      epics: details.epics.map((item) => (id === item.id ? epic : item))
    };
    setDetails({ ...details, ...updatedEpic });
  };

  const onRemoveEpic = (epicId: any) => {
    const updatedEpic = { epics: details.epics.filter((item) => item.id !== epicId) };
    setDetails({ ...details, ...updatedEpic });
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  return (
    <ProjectDetailsContext.Provider
      value={{
        ...details,
        isLoadingDetails,
        onUpsertSprint,
        onRemoveSprint,
        onUpdateSprint,
        onUpsertEpic,
        onUpdateEpic,
        onRemoveEpic
      }}
    >
      <ProjectDetailsDispatchContext.Provider value={setDetails}>
        {children}
      </ProjectDetailsDispatchContext.Provider>
    </ProjectDetailsContext.Provider>
  );
}

ProjectDetailsProvider.defaultProps = {
  children: null
};

export { ProjectDetailsDispatchContext, ProjectDetailsContext, ProjectDetailsProvider };

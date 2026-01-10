import { Category, ScheduleType } from './types.mjs';

type TemplateTask = {
    title: string;
    category: Category;
    scheduleType: ScheduleType;
    scheduleValue: number | null;
    notes: string | null;
};
type Template = {
    id: string;
    name: string;
    description: string;
    tasks: TemplateTask[];
};
declare const templates: Template[];

export { type Template, type TemplateTask, templates };

<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog'

import { MenubarItem } from '@/components/ui/menubar';


import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Input } from './ui/input'
import type { ImportFile } from '@/data/models/imports'
import { Button } from './ui/button'
import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from '@/config/appSettings'
import { useForwardPropsEmits, type DialogRootEmits, type DialogRootProps } from 'radix-vue'
import { nextTick, ref } from 'vue';
import { useImageStore, useLandmarksStore, useVirtualCameraStore } from '@/lib/stores';
import { Loader2 } from 'lucide-vue-next';

const repository = RepositoryFactory.get(repositorySettings.type)

const cameraStore = useVirtualCameraStore()
const landmarksStore = useLandmarksStore()
const imageStore = useImageStore()


const props = defineProps<DialogRootProps &
{
    title: string,
    imports: Array<ImportFile>
    description?: string,
    disableTrigger?: boolean
}>()

const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

const open = ref<boolean>(false)
const loading = ref<boolean>(false)

let fileMap = new Map<string, any>()
props.imports.forEach((importFile) => {
    fileMap.set(importFile.name, z.string())
})


const importFormSchema = toTypedSchema(z.object(
    Object.fromEntries(fileMap.entries())
))

const importForm = useForm({
    validationSchema: importFormSchema,
})

const onSubmit = importForm.handleSubmit(async (values) => {
    let vals = new Map<string, string>(Object.entries(values))

    console.log(vals)
    loading.value = true
    let path = await repository.importProject(props.title, vals)


    open.value = false
    nextTick(() => {
        loading.value = false
        if (path != null) {
            landmarksStore.$reset()
            imageStore.$reset()
            cameraStore.setPath(path)
        }
    })
})

function browse(index: number): Promise<string> {
    return repository.getImportFile(props.title, index)
}

</script>

<template>
    <div class="w-full max-h-dvh overflow-y-auto">
        <Dialog v-bind="forwarded" v-model:open="open">
            <DialogTrigger asChild>
                <MenubarItem inset :disabled="props.disableTrigger" @select="(event: Event) => event.preventDefault()">
                    {{ props.title }}
                </MenubarItem>
            </DialogTrigger>
            <DialogContent class="w-4/5 max-h-5/6">
                <DialogHeader>
                    <DialogTitle>{{ title }}</DialogTitle>
                    <DialogDescription>{{ description }}</DialogDescription>
                </DialogHeader>
                <form id="importForm" @submit="onSubmit" class="space-y-4">
                    <FormField v-for="(file, index) in imports" v-slot="{ value, handleChange, setValue }"
                        :name="file.name" class="w-full">
                        <FormItem>
                            <FormLabel>{{ file.label }}</FormLabel>
                            <FormControl>
                                <div v-if="file.file" class="flex flex-row space-x-2">
                                    <Input type="text" :placeholder="file.label" :model-value="value" disabled />
                                    <Button type="button" variant="secondary"
                                        @click="browse(index).then((res) => setValue(res))">Browse..</Button>
                                </div>
                                <Input v-else type="text" :placeholder="file.label" :model-value="value"
                                    @update:model-value="handleChange" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <DialogFooter>
                        <Button type="submit" :disabled="loading">
                            <Loader2 v-if="loading" class="w-4 h-4 mx-2 animate-spin" />
                            <span v-else>Confirm</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </div>
</template>
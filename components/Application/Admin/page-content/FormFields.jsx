'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

/* Form building blocks for Admin → Pages. All of them are react-hook-form
   fields bound by `name` (dot paths into the page content). */

// A titled card that groups related settings inside a tab.
export const FieldGroup = ({ title, description, action, children, className }) => (
    <section className={cn('rounded-md bg-card p-4 sm:p-6', className)}>
        <div className="mb-4 flex items-start justify-between gap-3">
            <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {action}
        </div>
        <div className="flex flex-col gap-5">{children}</div>
    </section>
)

export const TextField = ({ control, name, label, placeholder, hint, maxLength, type = 'text', className }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className={className}>
                <FormLabel className="flex w-full items-center justify-between gap-2">
                    <span>{label}</span>
                    {maxLength && type === 'text' && (
                        <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            {String(field.value ?? '').length}/{maxLength}
                        </span>
                    )}
                </FormLabel>
                <FormControl>
                    <Input
                        type={type}
                        placeholder={placeholder}
                        maxLength={type === 'text' ? maxLength : undefined}
                        {...field}
                        value={field.value ?? ''}
                    />
                </FormControl>
                {hint && <FormDescription>{hint}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
)

export const AreaField = ({ control, name, label, placeholder, hint, maxLength, rows = 3 }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel className="flex w-full items-center justify-between gap-2">
                    <span>{label}</span>
                    {maxLength && (
                        <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            {String(field.value ?? '').length}/{maxLength}
                        </span>
                    )}
                </FormLabel>
                <FormControl>
                    <Textarea rows={rows} placeholder={placeholder} maxLength={maxLength} {...field} value={field.value ?? ''} />
                </FormControl>
                {hint && <FormDescription>{hint}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
)

// Accessible on/off switch styled like the admin's primary controls.
export const Switch = ({ checked, onCheckedChange, id, disabled, label }) => (
    <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input'
        )}
    >
        <span
            className={cn(
                'pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform',
                checked ? 'translate-x-4' : 'translate-x-0.5'
            )}
        />
    </button>
)

export const SwitchField = ({ control, name, label, description }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border p-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <FormLabel className="text-sm font-medium">{label}</FormLabel>
                    {description && <FormDescription className="text-xs">{description}</FormDescription>}
                </div>
                <FormControl>
                    <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} label={label} />
                </FormControl>
                <FormMessage className="basis-full" />
            </FormItem>
        )}
    />
)

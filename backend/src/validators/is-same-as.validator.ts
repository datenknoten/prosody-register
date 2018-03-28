import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Decorator for IsSameAs
 */
export function IsSameAs(property: string, validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            constraints: [property],
            options: validationOptions,
            propertyName,
            target: object.constructor,
            validator: IsSameAsConstraint,
        });
    };
}

/**
 * Constraint for IsSameAs
 */
@ValidatorConstraint({ name: 'isLongerThan' })
export class IsSameAsConstraint implements ValidatorConstraintInterface {

    /**
     * validate stuff
     */
    public validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return  typeof value === 'string' &&
                typeof relatedValue === 'string' &&
                value === relatedValue;
    }

}
